export enum RoutePaths {
  AuthFlow = "/auth_flow",
  Root = "/",

  SpeakeasyRedirect = "speakeasy-redirect",

  Workspaces = "workspaces",
  Setup = "setup",
  Connections = "connections",
  Destination = "destination",
  Source = "source",
  Settings = "settings",
  Connection = "connection",
  ConnectorBuilder = "connector-builder",
}

export enum DestinationPaths {
  Root = ":destinationId/*", // currently our tabs rely on this * wildcard to detect which tab is currently active
  Settings = "settings",
  SelectDestinationNew = "new-destination",
  DestinationNew = "new-destination/:destinationDefinitionId",
}

export enum SourcePaths {
  Root = ":sourceId/*", // currently our tabs rely on this * wildcard to detect which tab is currently active
  Settings = "settings",
  SelectSourceNew = "new-source",
  SourceNew = "new-source/:sourceDefinitionId",
}
export const enum ConnectionRoutePaths {
  Root = ":connectionId/*",
  Status = "status",
  Transformation = "transformation",
  Replication = "replication",
  Settings = "settings",
  JobHistory = "job-history",
  ConnectionNew = "new-connection",
  Configure = "configure",
}
