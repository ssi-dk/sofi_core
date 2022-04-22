import React from "react";
import {
  Box,
  Button,
  Link,
  List,
  ListItem,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,
  Tbody,
  Td,
  Th,
  Tr,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

type SearchHelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SearchHelpModal = (props: SearchHelpModalProps) => {
  const { t } = useTranslation();
  const { isOpen, onClose } = props;

  return (
    <React.Fragment>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="6xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent mt="0">
          <ModalHeader pl="7">{t("Search Help")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto" px="7">
            <div>
              <Heading size="s">Syntax</Heading>
              <Box>
                SOFI Search is based on the{" "}
                <Link href="https://lucene.apache.org/core/2_9_4/queryparsersyntax.html">
                  Lucene query language
                </Link>
                . A query written in Lucene can be broken down into three parts:
              </Box>
              <br />
              <Box margin="auto" maxW="90%">
                <List>
                  <ListItem>
                    <b>Field</b> The display name or <code>internal_name</code>{" "}
                    of a specific column/field/attribute in the database. In
                    SOFI, fields are <em>NOT</em> case-sensitive.
                  </ListItem>
                  <ListItem>
                    <b>Terms</b> Items you would like to search for in the
                    database. You can search for Single Terms (&quot;OK&quot;)
                    and Phrases (&quot;Salmonella enterica&quot;). A single-word
                    term does not have to be enclosed in quotation marks, but if
                    it contains a space, then it does. In SOFI, terms are{" "}
                    <em>NOT</em> case-sensitive.
                  </ListItem>
                  <ListItem>
                    <b>Operators/Modifiers</b> A symbol or keyword used to
                    denote a logical operation.
                  </ListItem>
                </List>
                <Table>
                  <Tbody>
                    <Th>Operator/Modifier</Th>
                    <Th>Meaning</Th>
                    <Tr>
                      <Td>AND</Td>
                      <Td>Both input parameters return TRUE.</Td>
                    </Tr>
                    <Tr>
                      <Td>OR</Td>
                      <Td>At least one input parameter returns TRUE.</Td>
                    </Tr>
                    <Tr>
                      <Td>NOT</Td>
                      <Td>
                        The input parameter returns FALSE. NOT can also be
                        represented using the (&nbsp;<strong>- </strong>)
                        symbol.
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>*</Td>
                      <Td>
                        Wildcard that is a placeholder for multiple characters.
                        This can be used to perform &apos;fuzzy&apos; searches,
                        like <code>Salmonella*</code> to match any species of
                        that genus.
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
              <Heading size="s">Examples</Heading>

              <Box margin="auto" maxW="90%">
                <List spacing="6">
                  <ListItem>
                    <p>To fetch all analysis results for a specific isolate:</p>
                    <code>isolate_id:2009F00020</code>
                  </ListItem>

                  <ListItem>
                    <p>
                      To return all analysis results from SSI with
                      project_number 1:
                    </p>
                    <code>institution:ssi project_number:1</code>
                    <p>
                      <small>
                        Note that the <code>AND</code> is implicit.
                      </small>
                    </p>
                  </ListItem>
                  <ListItem>
                    <p>
                      To return everything where qc_action is either OK or
                      supplying lab:
                    </p>
                    <code>
                      qc_action:ok OR qc_action:&quot;supplying lab&quot;
                    </code>
                  </ListItem>
                  <ListItem>
                    <p>
                      To find all analysis results for any species of
                      Streptococcus:
                    </p>
                    <code>
                      species_final:Streptococcus* OR
                      qc_provided_species:Streptococcus*
                    </code>
                  </ListItem>
                  <ListItem>
                    <p>
                      If you know the exact sequence_id you&apos;re interested
                      in, you can search for it directly:
                    </p>
                    <code>
                      200807_NB991237_0450_N_WGS_272_AHJH2VAFX2___2004W00215
                    </code>
                    <p>
                      <small>
                        A query with no <code>field:</code> specified implicitly
                        searches in <code>sequence_id</code>.
                      </small>
                    </p>
                  </ListItem>
                  <ListItem>
                    <p>
                      Sometimes special symbols used in the search syntax are
                      also present in the text you want to search on. In that
                      case, you can &apos;escape&apos; that character by
                      prefixing it with <code>\</code>.
                    </p>
                    <code>institution:fvst st:15\*</code>
                    <p>
                      <small>
                        Gives results where the ST is specifically
                        &quot;15*&quot; (15 star), while <code>st:15*</code>{" "}
                        would also return ST values 15, 152, 157, etc.
                      </small>
                    </p>
                  </ListItem>
                  <ListItem>
                    <p>
                      It's possible to search over a range of dates, both
                      inclusive and exclusive. Use square-brackets (
                      <code>[ TO ]</code>) when a term should be inclusive. Use
                      curly-brackets (<code>&#123; TO &#125;</code>) when a term
                      should be exclusive. It's possible to mix them, such that
                      one side of the range is inclusive while the other is not.
                    </p>
                    <code>date_epi:[2022-02-22 TO 2022-04-14&#125;</code>
                    <p>
                      <small>
                        Gives results where the Epi export date is 2022-02-22 or
                        later, but not on 2022-04-14 or later.
                      </small>
                    </p>
                  </ListItem>
                  <ListItem>
                    <p>
                      Search is also possible over open-ended ranges. Use{" "}
                      <code>*</code> for the end of the range that should not be
                      limited.
                    </p>
                    <code>date_approved_st:[2021-05-10 TO *]</code>
                    <p>
                      <small>
                        Gives results where st approval date is 2021-05-10 or
                        later.
                      </small>
                    </p>
                  </ListItem>
                </List>
              </Box>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              {t("Close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default React.memo(SearchHelpModal);
