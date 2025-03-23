import { Footer } from "../components/footer";
import NavigationBar from "../components/navigator";
import { ViewingPage } from "../components/viewing";

export const Viewing = () => {
  return (
    <>
      <NavigationBar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
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
          <ViewingPage />
        </div>
        <Footer />
      </div>
    </>
  );
};
