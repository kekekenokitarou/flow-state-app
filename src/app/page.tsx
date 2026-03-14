import { getHelloMessage } from "@/server/services/hello";
import { FlowScreen } from "@/components/FlowScreen";

export default function Page() {
  const message = getHelloMessage();
  return <FlowScreen message={message} />;
}
