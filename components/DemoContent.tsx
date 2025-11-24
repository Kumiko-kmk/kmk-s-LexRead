import React from 'react';

export const DemoContent: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Gemini Translation Demo
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Select any text below to see the translation widget in action. 
          The floating window will capture your selection and translate it using Google Gemini's powerful models.
        </p>
      </header>

      <article className="prose prose-lg prose-slate mx-auto bg-white p-12 rounded-2xl shadow-sm border border-slate-100">
        <h2>The Future of Artificial Intelligence</h2>
        <p>
          Artificial intelligence (AI) is rapidly transforming industries, from healthcare to finance. 
          Machine learning algorithms can now analyze vast datasets to identify patterns that were previously invisible to human observers. 
          This capability is leading to breakthroughs in drug discovery, personalized medicine, and autonomous transportation.
        </p>
        <p>
          Generative AI, like Google's Gemini, represents a significant leap forward. 
          Unlike traditional AI that classifies data, generative models create new content—text, images, code, and more. 
          This creative potential opens up new avenues for collaboration between humans and machines.
        </p>
        
        <h3>Global Impact</h3>
        <p>
          The economic impact of AI is expected to be profound. 
          Economists predict that AI technologies could add trillions of dollars to the global economy over the next decade. 
          However, this growth also brings challenges, such as the need for ethical guidelines and workforce retraining programs.
        </p>
        
        <blockquote>
          "Technology is best when it brings people together."
        </blockquote>

        <p>
          As we move forward, it is crucial to develop AI responsibly. 
          Ensuring transparency, fairness, and accountability in AI systems will be key to building trust and maximizing the benefits for society as a whole.
          We are standing at the threshold of a new era, one where intelligence is ubiquitous and empowering.
        </p>
        
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="text-blue-900 font-semibold mb-2">Try selecting this Spanish text:</h4>
          <p className="text-blue-800 italic">
            "La inteligencia artificial está cambiando el mundo a una velocidad increíble. 
            Es importante que aprendamos a utilizar estas herramientas para mejorar nuestras vidas y construir un futuro mejor para todos."
          </p>
        </div>
      </article>

      <div className="mt-12 text-center text-slate-400 text-sm">
        <p>Demo application built with React, Tailwind CSS, and Google Gemini API.</p>
      </div>
    </div>
  );
};
