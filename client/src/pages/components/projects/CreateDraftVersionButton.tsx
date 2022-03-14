import { gql, useMutation } from "@apollo/client";
import { Button } from "@chakra-ui/react";

const CREATE_DRAFT_VERSION = gql`
  mutation CreateDraftVersion($project_id: String!) {
    createDraftVersion(projectId: $project_id) {
      id
    }
  }
`;

interface CreateDraftVersionButtonProps {
  project_id: string;
  onComplete: (id: string) => void;
}

function CreateDraftVersionButton({
  onComplete,
  project_id,
}: CreateDraftVersionButtonProps) {
  console.log("version");
  const [createDraftVersion, { loading, error }] =
    useMutation(CREATE_DRAFT_VERSION);
  return (
    <>
      <Button
        isLoading={loading}
        isDisabled={loading}
        onClick={async () => {
          const resp = await createDraftVersion({
            variables: {
              project_id,
            },
          });
          console.log("resp", resp);
          onComplete(resp.data?.createDraftVersion?.id);
        }}
      >
        Create New Version
      </Button>
    </>
  );
}

export default CreateDraftVersionButton;
