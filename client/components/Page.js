import Header from './Header';
import Meta from './Meta';

function About({ children }) {
  return (
    <div>
      <Meta />
      <Header />
      <h1>About Sick Fit</h1>
      {children}
    </div>
  );
}

export default About;
