import agentCatalog from "../../config/routeTrustAgents.json";

export interface RouteTrustAgent {
  id: string;
  name: string;
  role: string;
  branch: string;
  module: string;
  aliases: string[];
  critical: boolean;
  siteVisible: boolean;
}

export const routeTrustAgents = agentCatalog as RouteTrustAgent[];

export function getAgentById(agentId: string) {
  return routeTrustAgents.find((agent) => agent.id === agentId) || null;
}

export function getAgentByName(name: string) {
  const normalized = name.trim().toLowerCase();
  return (
    routeTrustAgents.find((agent) => {
      const candidates = [agent.id, agent.name, agent.role, ...agent.aliases].map((value) => value.toLowerCase());
      return candidates.includes(normalized);
    }) || null
  );
}

export function getCriticalSiteAgents() {
  return routeTrustAgents.filter((agent) => agent.critical && agent.siteVisible);
}
