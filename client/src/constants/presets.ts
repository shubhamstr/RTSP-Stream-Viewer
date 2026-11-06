export interface DefaultStreamOption {
  name: string;
  url: string;
  tag: string;
}

export const DEFAULT_STREAMS: DefaultStreamOption[] = [
  {
    name: 'Road & Trees (MediaMTX)',
    url: 'rtsp://viewer:viewer_password_123@localhost:8554/road_and_trees',
    tag: 'MediaMTX RTSP',
  },
  {
    name: 'Watering Plant (MediaMTX)',
    url: 'rtsp://viewer:viewer_password_123@localhost:8554/watering_plant',
    tag: 'MediaMTX RTSP',
  },
  {
    name: 'Earth (MediaMTX)',
    url: 'rtsp://viewer:viewer_password_123@localhost:8554/earth',
    tag: 'MediaMTX RTSP',
  },
];

