import { SocketStatusProps } from "../types";

const SocketStatus: React.FC<SocketStatusProps> = ({
  isConnected,
  socketId,
}) => (
  <div className="socket-status">
    {isConnected ? (
      <span className="status-connected">
        Connected {socketId && `(ID: ${socketId})`}
      </span>
    ) : (
      <span className="status-disconnected">Disconnected</span>
    )}
  </div>
);

export default SocketStatus;