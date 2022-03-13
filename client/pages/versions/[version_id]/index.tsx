import { useRouter } from "next/router";
import Head from "next/head";
import { useDispatch } from "react-redux";
import { NextPageWithLayout } from "types/next";
import ProjectEditor from "@components/projects/editor/ProjectEditor";
import ProjectEditorLayout from "@layouts/ProjectEditorLayout";

const ProjectVersionPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { version_id } = router?.query;

  return (
    <>
      <Head>
        <title>Project</title>
      </Head>
      {/* data ? <ProjectDeprecated id={data.project?.id as string} /> : null */}
      {version_id ? (
        <ProjectEditor version_id={version_id as string} />
      ) : (
        "no version"
      )}
    </>
  );
};

ProjectVersionPage.getLayout = function getLayout(page) {
  return <ProjectEditorLayout>{page}</ProjectEditorLayout>;
};
export default ProjectVersionPage;
