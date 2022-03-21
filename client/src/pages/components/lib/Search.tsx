import {
  Text,
  Box,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Spinner,
  Flex,
  InputProps,
  BoxProps,
  LayoutProps,
  Icon,
} from "@chakra-ui/react";
import ImportGithubRepo from "@components/projects/editor/ImportGithubRepo";
import { Repos } from "@gql/__generated__/Repos";
import Fuse from "fuse.js";
import * as Icons from "react-feather";
import { useState, useMemo, PropsWithChildren } from "react";
import colors from "src/theme/colors";

const fuseOptions = {
  // isCaseSensitive: false,
  // includeScore: false,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  minMatchCharLength: 1,
  // location: 0,
  // threshold: 0.6,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys: ["repo_name", "full_repo_name"],
};

type Props<T> = {
  data: T[];
  isLoading?: boolean;
  searchPlaceholder: string;
  maxResultsHeight: LayoutProps["maxHeight"];
  children: React.FC<{ key: number; item: T }>;
} & BoxProps;
export default function Search<T>({
  data,
  children,
  isLoading = false,
  searchPlaceholder,
  maxResultsHeight = "200px",
  ...props
}: Props<T>) {
  const [searchValue, setSearchValue] = useState("");
  const fuse = useMemo(() => {
    return new Fuse<T>(data, fuseOptions);
  }, [data]);

  const searchResults = useMemo(() => {
    return searchValue !== ""
      ? fuse.search(searchValue).map((obj) => obj.item)
      : data || [];
  }, [fuse, data, searchValue]);

  return (
    <Box alignSelf="center">
      <FormControl mb="12px">
        <Flex display="flex" alignItems="center">
          <Icon
            stroke={colors.white}
            as={Icons.Search}
            strokeWidth="3px"
            mr="12px"
          />
          <Input
            id="kontour-github"
            isDisabled={isLoading}
            placeholder={isLoading ? "Loading..." : searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            {...props}
          />
        </Flex>
        {isLoading ? (
          <FormHelperText display="flex" alignItems="center">
            <Spinner size="xs" mr="8px" />
            Loading...
          </FormHelperText>
        ) : searchValue !== "" ? (
          <FormHelperText>
            <Text layerStyle="green">
              <b>{searchResults.length} results</b> found matching &quot;
              {searchValue}
              &quot;
            </Text>
          </FormHelperText>
        ) : (
          <FormHelperText>
            <Text layerStyle="green" as="b">
              {data.length || 0} results
            </Text>
          </FormHelperText>
        )}
      </FormControl>
      {!isLoading && (
        <Flex
          maxHeight={maxResultsHeight}
          overflowY="scroll"
          border={`1px solid ${colors.contourBorder[500]}`}
          flexDirection="column"
        >
          <>
            {searchResults.map((item, idx) => {
              return <>{children && children({ key: idx, item })}</>;
            })}
          </>
        </Flex>
      )}
    </Box>
  );
}
