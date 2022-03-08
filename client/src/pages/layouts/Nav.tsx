import { Text, Flex, Spacer, Link, HStack } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import theme from "src/theme";
import NextLink from "next/link";
import { useAppSelector } from "src/redux/hooks";
import { selectTwitterHandle } from "@redux/slices/userSlice";
import { useLoggedInUser } from "@hooks/index";
import DiscordLink from "@components/buttons/DiscordLink";
import Logo from "@components/logo/Logo";

function StickyHeader({}: PropsWithChildren<{}>) {
  const { loggedInUserId } = useLoggedInUser();
  const handle = useAppSelector(selectTwitterHandle);
  return (
    <Flex sx={styles.sticky}>
      <NextLink href={`/`} passHref>
        <Link>
          <Logo type="dynamic" />
        </Link>
      </NextLink>
      <Spacer />

      <HStack gap="18px">
        <DiscordLink color={theme.colors.discordPurple} size={20} />
        <NextLink href="/faq">
          <Link href="/faq">
            <Text fontSize="20px">FAQ</Text>
          </Link>
        </NextLink>
        <NextLink href="/explore">
          <Link href="/explore">
            <Text fontSize="20px">Explore</Text>
          </Link>
        </NextLink>
      </HStack>
    </Flex>
  );
}

const styles = {
  sticky: {
    zIndex: 1000,
    top: 0,
    left: 0,
    position: "fixed",
    right: 0,
    alignItems: "center",

    boxShadow: "rgb(0 0 0 / 8%) 0px 1px 12px !important",
    padding: {
      base: "0 32px",
      md: "0 80px",
    },
    height: {
      base: "52px",
      md: "80px",
    },
    backgroundColor: theme.colors.bountyHeaderGreen,
  },
};

export default StickyHeader;
