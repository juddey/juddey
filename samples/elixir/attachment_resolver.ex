defmodule Chapel.Resolvers.Attachment do
  alias Chapel.Shared
  alias Chapel.Deletion
  @verk Application.get_env(:chapel, :verk_lib, Verk)

  def update_attachment(_root, %{input: %{ status: status} = input }, %{context: %{person: _person}}) when status == "deleted" do
    with attachment <- Shared.get_attachments!(input.id),
          {:ok, attachment} <- Deletion.mark_for_deletion(attachment),
          {:ok, _queue} <- enqueue_to_feed(attachment.post_id) do # TODO - Add Determine Kind of attachment...
      {:ok, attachment}
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  def update_attachment(_root, %{input: input}, %{context: %{person: _person}}) do
    with curr_attachment <- Shared.get_attachments!(input.id),
         {:ok, attachment} <- Shared.update_attachments(curr_attachment, input) do
          if attachment.status == "uploaded" do
            @verk.enqueue(%Verk.Job{queue: :default, class: "ChapelWeb.Workers.MediaTransformer", args: [attachment.id]})
          end
      {:ok, attachment}
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  defp enqueue_to_feed(id) do
    @verk.enqueue(%Verk.Job{queue: :default, class: "ChapelWeb.Workers.FeedProcessor", args: [%{kind: "post", id: id}]})
  end

end
