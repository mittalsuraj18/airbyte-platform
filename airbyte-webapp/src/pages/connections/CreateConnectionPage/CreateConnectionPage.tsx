import { useMemo } from "react";
import { useIntl } from "react-intl";
import { Navigate, useSearchParams } from "react-router-dom";

import { HeadTitle } from "components/common/HeadTitle";
import { MainPageWithScroll } from "components/common/MainPageWithScroll";
import { SelectDestination } from "components/connection/CreateConnection/SelectDestination";
import { SelectSource } from "components/connection/CreateConnection/SelectSource";
import { FormPageContent } from "components/ConnectorBlocks";
import { NextPageHeaderWithNavigation } from "components/ui/PageHeader/NextPageHeaderWithNavigation";

import { AppActionCodes } from "hooks/services/AppMonitoringService";
import { useGetDestination } from "hooks/services/useDestinationHook";
import { useGetSource } from "hooks/services/useSourceHook";
import { ConnectionRoutePaths, RoutePaths } from "pages/routePaths";
import { useCurrentWorkspaceId } from "services/workspaces/WorkspacesService";
import { trackAction } from "utils/datadog";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout";

export const CreateConnectionPage = () => {
  const { formatMessage } = useIntl();
  const workspaceId = useCurrentWorkspaceId();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get("sourceId");
  const destinationId = searchParams.get("destinationId");
  const source = useGetSource(sourceId);
  const destination = useGetDestination(destinationId);

  const breadcrumbsData = [
    {
      label: formatMessage({ id: "sidebar.connections" }),
      to: `/${RoutePaths.Workspaces}/${workspaceId}/${RoutePaths.Connections}/`,
    },
    { label: formatMessage({ id: "connection.newConnection" }) },
  ];
  const currentStep = useMemo(() => {
    if (!source) {
      return <SelectSource />;
    }
    // source is configured, but destination is not
    if (!destination) {
      return <SelectDestination />;
    }
    // both source and destination are configured, configure the connection now
    if (source && destination) {
      return (
        <Navigate
          to={{
            pathname: `/${RoutePaths.Workspaces}/${workspaceId}/${RoutePaths.Connections}/${ConnectionRoutePaths.ConnectionNew}/${ConnectionRoutePaths.Configure}`,
            search: `?${searchParams.toString()}`,
          }}
        />
      );
    }

    trackAction(AppActionCodes.UNEXPECTED_CONNECTION_FLOW_STATE, {
      currentStep,
      sourceId: source?.sourceId,
      destinationId: destination?.destinationId,
      workspaceId,
    });
    return (
      <Navigate
        to={`/${RoutePaths.Workspaces}/${workspaceId}/${RoutePaths.Connections}/${ConnectionRoutePaths.ConnectionNew}`}
      />
    );
  }, [source, destination, workspaceId, searchParams]);

  return (
    <ConnectorDocumentationWrapper>
      <MainPageWithScroll
        headTitle={<HeadTitle titles={[{ id: "connection.newConnectionTitle" }]} />}
        pageTitle={<NextPageHeaderWithNavigation breadcrumbsData={breadcrumbsData} />}
      >
        <FormPageContent>{currentStep}</FormPageContent>
      </MainPageWithScroll>
    </ConnectorDocumentationWrapper>
  );
};
