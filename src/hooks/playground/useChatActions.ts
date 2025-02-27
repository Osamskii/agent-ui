import { useCallback } from "react";
import { toast } from "sonner";

import { usePlaygroundStore } from "@/stores/PlaygroundStore";

import { ComboboxAgent, type PlaygroundChatMessage } from "@/types/playground";
import {
  getPlaygroundAgentsAPI,
  getPlaygroundStatusAPI,
} from "@/api/playground";
import { useQueryState } from "nuqs";

const useChatActions = () => {
  const selectedEndpoint = usePlaygroundStore(
    (state) => state.selectedEndpoint,
  );
  const [,setAgentId] = useQueryState("agent");
  const [,setModel] = useQueryState("model");
  const setMessages = usePlaygroundStore((state) => state.setMessages);
  const setIsEndpointActive = usePlaygroundStore(
    (state) => state.setIsEndpointActive,
  );
  const setAgents = usePlaygroundStore((state) => state.setAgents);

  const getStatus = useCallback(async () => {
    try {
      const status = await getPlaygroundStatusAPI(selectedEndpoint);
      return status;
    } catch {
      toast.error("Error fetching status");
      return 503;
    }
  }, [selectedEndpoint]);

  const getAgents = useCallback(async () => {
    try {
      const agents = await getPlaygroundAgentsAPI(selectedEndpoint);
      return agents;
    } catch {
      toast.error("Error fetching agents");
      return [];
    }
  }, [selectedEndpoint]);

  const clearChat = useCallback(() => {
    setMessages([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMessage = useCallback(
    (message: PlaygroundChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    },
    [setMessages],
  );

  const clearData = useCallback(() => {
    setAgentId(null);
    setModel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = useCallback(async () => {
    const status = await getStatus();
    let agents:ComboboxAgent[] = [];
    if (status === 200) {
      setIsEndpointActive(true);
      agents = await getAgents();
    } else {
      setIsEndpointActive(false);
    }
    clearData();
    setAgents(agents);
    return agents;
  }, [getStatus, getAgents, setIsEndpointActive, setAgents]);

  return {
    clearChat,
    addMessage,
    getAgents,
    loadData,
  };
};

export default useChatActions;
