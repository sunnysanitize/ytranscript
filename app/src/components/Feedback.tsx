interface Props {
  message: string;
  type: "info" | "success" | "error";
}

export default function Feedback({ message, type }: Props) {
  if (!message) return null;

  return (
    <div className={`feedback feedback-${type}`}>
      {message}
    </div>
  );
}
