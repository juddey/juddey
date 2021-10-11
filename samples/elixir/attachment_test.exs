defmodule Chapel.Test.Integration.AttachmentTest do
  use ChapelWeb.ConnCase
  alias Chapel.Test.IntegrationHelpers, as: Helpers
  alias Chapel.Repo

  @update_mutation """
  mutation updateAttachment($input: AttachmentInput!) {
   attachment: updateAttachment(input: $input) {
      id,
    }
  }
  """

  describe("attachments") do
    setup do
      post = insert(:post)
      attachment = insert(:attachment, post_id: post.id)
      %{attachment: attachment}
    end

    test "updates the attachment", %{attachment: attachment} do
      {:ok, access_token, person, _user} = Helpers.setup_user([:member])

      church_id =
        Map.get(person, :roles)
        |> Enum.find(fn x -> x.role == :member && !is_nil(x.church_id) end)
        |> Map.get(:church_id)

      new_data = %{id: attachment.id, status: "uploaded", church_id: church_id}

      response =
        build_conn()
        |> graphql_query(
          %{query: @update_mutation, variables: %{input: new_data}},
          access_token
        )

      id = Map.get(response, "data") |> Map.get("attachment") |> Map.get("id")
      assert id
      refute Repo.get!(Chapel.Shared.Attachment, id) |> Map.get(:deleted_at)
    end

    test "soft deletes the attachment", %{attachment: attachment} do
      {:ok, access_token, person, _user} = Helpers.setup_user([:member])

      church_id =
        Map.get(person, :roles)
        |> Enum.find(fn x -> x.role == :member && !is_nil(x.church_id) end)
        |> Map.get(:church_id)

      new_data = %{id: attachment.id, status: "deleted", church_id: church_id}

      response =
        build_conn()
        |> graphql_query(
          %{query: @update_mutation, variables: %{input: new_data}},
          access_token
        )

      id = Map.get(response, "data") |> Map.get("attachment") |> Map.get("id")
      assert id
      assert Repo.get!(Chapel.Shared.Attachment, id) |> Map.get(:deleted_at)
    end
  end
end
