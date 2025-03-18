import { Link } from "react-router";
export const ErrorRoute = () => {
  return (
    <div
      className="main flex align-items-center justify-content-center"
      style={{ height: "100vh", padding: "0" }}
    >
      <div>
        <div className="container">
          <div className="grid gap-8">
            <div className="grid-item col-6 flex flex-column justify-content-center align-items-start">
              <h1>Page not found :</h1>
              <p className="h6 w-9">
                The page you are looking for might have been removed had its
                name changed or is temporarily unavailable.
              </p>
              <div>
                <Link
                  to="/"
                  className="text-decoration-none text-white p-button p-button-primary mt-3"
                >
                  Go to homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
