import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import styles from "@styles/Home.module.css";

import { withCookieAuth } from "@utils/auth";
import { IS_SERVER } from "@utils/constants";
import { getLocalStorageKey } from "@utils/api_client";
import { Container } from "@chakra-ui/react";
import CreateProject from "@components/projects/CreateProject";
import { gql, useQuery } from "@apollo/client";
import Project from "@components/projects/Project";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  reset,
  setData,
  mergeData,
  selectData,
} from "@redux/slices/projectSlice";

const PROJECT = gql`
  query Project($id: String!) {
    project(id: $id) {
      id
      data
    }
  }
`;

const BoardPage = () => {
  const router = useRouter();
  const { project_id } = router?.query;
  const dispatch = useDispatch();

  const { data, loading, error } = useQuery(PROJECT, {
    variables: { id: project_id },
  });
  useEffect(() => {
    if (data) {
      dispatch(setData(data.project?.data));
    }
  }, [data, dispatch]);

  return (
    <Container maxW="container.lg" variant="base">
      <Head>
        <title>Project</title>
      </Head>
      <main className={styles.main}>
        <CreateProject />
        {data ? <Project id={data.project?.id as string} /> : null}
      </main>
    </Container>
  );
};
export default BoardPage;
