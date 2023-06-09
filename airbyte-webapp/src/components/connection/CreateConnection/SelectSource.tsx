import { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { useSearchParams } from "react-router-dom";

import { CloudInviteUsersHint } from "components/CloudInviteUsersHint";
import { Box } from "components/ui/Box";
import { Card } from "components/ui/Card";
import { Heading } from "components/ui/Heading";

import { useConfirmationModalService } from "hooks/services/ConfirmationModal";
import { useFormChangeTrackerService } from "hooks/services/FormChangeTracker";
import { useSourceList } from "hooks/services/useSourceHook";
import { useDocumentationPanelContext } from "views/Connector/ConnectorDocumentationLayout/DocumentationPanelContext";

import { CreateNewSource } from "./CreateNewSource";
import { RadioButtonTiles } from "./RadioButtonTiles";
import { SelectExistingConnector } from "./SelectExistingConnector";

export type SourceType = "existing" | "new";

const EXISTING_SOURCE_TYPE = "existing";
const NEW_SOURCE_TYPE = "new";
const SOURCE_TYPE_PARAM = "sourceType";
const SOURCE_ID_PARAM = "sourceId";

export const SelectSource: React.FC = () => {
  const { sources } = useSourceList();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSourceType = useMemo(() => {
    return sources.length === 0 ? NEW_SOURCE_TYPE : searchParams.get(SOURCE_TYPE_PARAM) ?? EXISTING_SOURCE_TYPE;
  }, [searchParams, sources.length]);

  const { hasFormChanges } = useFormChangeTrackerService();
  const { openConfirmationModal, closeConfirmationModal } = useConfirmationModalService();
  const { setDocumentationPanelOpen } = useDocumentationPanelContext();

  const selectSourceType = (sourceType: SourceType) => {
    searchParams.set(SOURCE_TYPE_PARAM, sourceType);
    setSearchParams(searchParams);
  };

  const selectSource = (sourceId: string) => {
    searchParams.delete(SOURCE_TYPE_PARAM);
    searchParams.set(SOURCE_ID_PARAM, sourceId);
    setSearchParams(searchParams);
  };

  const onSelectSourceType = (sourceType: SourceType) => {
    if (hasFormChanges) {
      openConfirmationModal({
        title: "form.discardChanges",
        text: "form.discardChangesConfirmation",
        submitButtonText: "form.discardChanges",
        onSubmit: () => {
          closeConfirmationModal();
          selectSourceType(sourceType);
          if (sourceType === EXISTING_SOURCE_TYPE) {
            setDocumentationPanelOpen(false);
          }
        },
        onClose: () => {
          selectSourceType(sourceType);
        },
      });
    } else {
      selectSourceType(sourceType);
      if (sourceType === EXISTING_SOURCE_TYPE) {
        setDocumentationPanelOpen(false);
      }
    }
  };

  return (
    <>
      <Card withPadding>
        <Heading as="h2">
          <FormattedMessage id="connectionForm.defineSource" />
        </Heading>
        <Box mt="md">
          <RadioButtonTiles
            name="sourceType"
            options={[
              {
                value: EXISTING_SOURCE_TYPE,
                label: "connectionForm.sourceExisting",
                description: "connectionForm.sourceExistingDescription",
                disabled: sources.length === 0,
              },
              {
                value: NEW_SOURCE_TYPE,
                label: "onboarding.sourceSetUp",
                description: "onboarding.sourceSetUp.description",
              },
            ]}
            selectedValue={selectedSourceType}
            onSelectRadioButton={(id) => onSelectSourceType(id)}
          />
        </Box>
      </Card>
      <Box mt="xl">
        {selectedSourceType === EXISTING_SOURCE_TYPE && (
          <SelectExistingConnector connectors={sources} selectConnector={selectSource} />
        )}
        {selectedSourceType === NEW_SOURCE_TYPE && (
          <CreateNewSource onSourceCreated={(sourceId) => selectSource(sourceId)} />
        )}
      </Box>
      <CloudInviteUsersHint connectorType="source" />
    </>
  );
};
