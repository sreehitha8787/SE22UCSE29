import './App.css';
import Header from './components/Header';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <section id="home">
          <h2>Welcome to My Website</h2>
          <p>This is a simple website built with React.</p>
        </section>
        
        <section id="about">
          <h2>About Us</h2>
          <p>Learn more about our company and services.</p>
        </section>

        <section id="contact">
          <h2>Contact Us</h2>
          <p>Get in touch with us for more information.</p>
        </section>
      </main>
    </div>
  );
}

export default App;
