interface Version {
  sprint: string;
  timestamp: number;
}

interface TeamDetail {
  name: string;
  versions: Version[];
}

export {TeamDetail, Version};
