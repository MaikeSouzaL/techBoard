if (process.argv[2] === 'test') {
  fetch('http://localhost:5000/api/brands')
    .then(res => res.json())
    .then(console.log)
    .catch(console.error);
}
