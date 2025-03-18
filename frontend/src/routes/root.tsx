import { Outlet } from "react-router";
import NavigationBar from "../components/navigator";
import { Footer } from "../components/footer";

export const RootRoute = () => {
  return (
    <>
      <NavigationBar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 80px)",
          marginTop: "80px",
          marginLeft: "90px",
          marginRight: "20px",
        }}
      >
        <div
          style={{
            flexGrow: 1,
            overflow: "auto",
            marginBottom: "20px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  );
};
