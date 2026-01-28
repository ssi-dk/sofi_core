function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export const WsTag = (props: { tag: string }) => (
  <div
    id={props.tag}
    style={{
      margin: "2px",
      padding: "2px",
      borderRadius: "5px",
      fontSize: "14px",
      backgroundColor: stringToColor(props.tag),
    }}
  >
    {props.tag}
  </div>
);
