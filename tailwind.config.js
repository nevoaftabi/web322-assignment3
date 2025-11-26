module.exports = {
  content: [
    "./views/**/*.ejs",  
    "./public/**/*.js"
  ],
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui")
  ],
  daisyui: {
    themes: ["dark"]   
  },
};
