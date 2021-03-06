import {
  Box,
  Flex,
  Text,
  Icon,
  Spacer,
  Divider,
  Heading,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import colors from "src/theme/colors";
import * as Icons from "react-feather";
import { gql, useSubscription } from "@apollo/client";
import { ConsoleLogViewFragment } from "@gql/__generated__/ConsoleLogViewFragment";
import { selectAddress } from "@redux/slices/ethSlice";
import { useAppSelector } from "@redux/hooks";
import { useAuthenticatedSubscription } from "@hooks/index";
import { createGraphQLClient } from "@gql/GraphQLClient";
import { AuthContext } from "@utils/auth";
import {
  OnConsoleLogSubscription,
  OnConsoleLogSubscriptionVariables,
} from "@gql/__generated__/OnConsoleLogSubscription";

type ConsoleLogLineProps = { log: Log };

function ConsoleLogLine({ log }: ConsoleLogLineProps) {
  return (
    <>
      {log.message.split("\n").map((l, idx) => (
        <Flex
          key={idx}
          height="40px"
          width="100%"
          alignItems="center"
          px="24px"
        >
          {idx === 0 ? (
            <Icon
              color={colors.contourGreen[500]}
              as={Icons.ChevronRight}
              strokeWidth="3px"
              mr="12px"
            />
          ) : null}
          <Text variant="code">{l}</Text>
        </Flex>
      ))}
    </>
  );
}

type ConsoleFinalLogLineProps = { showBorder: boolean; onClick: () => void };

function ConsoleFinalLogLine({
  showBorder,
  onClick,
}: ConsoleFinalLogLineProps) {
  return (
    <Flex
      height="60px"
      width="100%"
      alignItems="center"
      px="24px"
      onClick={onClick}
      cursor="pointer"
    >
      <Flex
        alignItems="center"
        as={motion.div}
        width="100%"
        height="100%"
        borderTop={showBorder ? "1px solid grey" : "none"}
      >
        <Text
          fontWeight="700"
          layerStyle="blue"
          height="60px"
          display="flex"
          alignItems="center"
          mr="12px"
          sx={{
            fontSize: "20px",
            fontWeight: 500,
          }}
        >
          console.log
        </Text>
      </Flex>
    </Flex>
  );
}

type Props = {
  contract?: ConsoleLogViewFragment;
};

type Log = {
  blockNum: string;
  from: string;
  message: string;
  to: string;
};

export default function ConsoleLogView({ contract }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const selectedAddress = useAppSelector(selectAddress);

  const { data, loading } = useAuthenticatedSubscription<
    OnConsoleLogSubscription,
    OnConsoleLogSubscriptionVariables
  >(LOGS_SUBSCRIPTION, {
    variables: { userAddress: selectedAddress },
  });

  useEffect(() => {
    if (data?.subscribeToLogs) {
      setLogs([...logs, data.subscribeToLogs as Log]);
    }
    // do not add logs here, will cause infinite
  }, [data]);
  console.log("data", data);

  return (
    <Flex
      sx={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
      alignItems="center"
      as={motion.div}
      opacity="80%"
      height="auto"
      width="1000px"
      maxWidth="80%"
      maxHeight="30%"
      overflowY="scroll"
      bgColor={colors.contourBackgroundDarker}
      position="fixed"
      left="48px"
      bottom="48px"
      transition="opacity .2s ease-in-out"
      boxShadow="0px 0px 20px rgba(0,0,0,0.12)"
      _hover={{
        opacity: "100%",
      }}
    >
      <Flex flexDirection="column" flexGrow="1">
        {logs.length > 0 && (
          <Box
            as={motion.div}
            overflow="hidden"
            animate={{
              height: expanded ? "auto" : "0px",
            }}
          >
            {
              // show all except last
              logs.map((log, idx) => {
                return <ConsoleLogLine key={idx} log={log} />;
              })
            }
          </Box>
        )}
        {logs.length <= 1 && (
          <Box
            as={motion.div}
            overflow="hidden"
            animate={{
              height: expanded ? "40px" : "0px",
            }}
            ml="24px"
          ></Box>
        )}
        <ConsoleFinalLogLine
          showBorder={expanded}
          onClick={() => {
            setExpanded(!expanded);
          }}
        />
      </Flex>
      <Flex
        alignItems="center"
        flexShrink="0"
        width="80px"
        height="100%"
        justifyContent="center"
        cursor="pointer"
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        {expanded ? (
          <Icon
            stroke={colors.contourBlue[500]}
            as={Icons.Minimize2}
            strokeWidth="3px"
          />
        ) : (
          <Icon
            as={Icons.Maximize2}
            stroke={colors.contourBlue[500]}
            strokeWidth="3px"
          />
        )}
      </Flex>
    </Flex>
  );
}

ConsoleLogView.fragments = {
  contract: gql`
    fragment ConsoleLogViewFragment on Contract {
      id
      address
    }
  `,
};

const LOGS_SUBSCRIPTION = gql`
  subscription OnConsoleLogSubscription($userAddress: String!) {
    subscribeToLogs(from: $userAddress)
  }
`;
