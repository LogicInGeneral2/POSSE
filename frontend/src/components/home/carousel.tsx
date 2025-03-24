import Carousel from "react-material-ui-carousel";
import { Box, Typography } from "@mui/material";
import { AnnouncementTypes } from "../../services/types";
import { useEffect, useState } from "react";
import { getAnnouncements } from "../../services";
import LoadingSpinner from "../commons/loading";
import { Item } from "./items";
import ErrorNotice from "../commons/error";

function Announcements() {
  const [announcements, setAnnouncements] = useState<AnnouncementTypes[]>([]);
  const [isLoading, setIsloading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const data = await getAnnouncements();
      setAnnouncements(data);
      setIsloading(false);
    };
    fetchAnnouncements();
  }, []);

  if (!announcements) {
    return <ErrorNotice />;
  }

  return (
    <Carousel>
      {isLoading ? (
        <Box>
          <LoadingSpinner />
        </Box>
      ) : (
        announcements.map((item) => <Item key={item.id} item={item} />)
      )}
    </Carousel>
  );
}

export default Announcements;
