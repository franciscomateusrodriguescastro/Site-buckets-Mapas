async function carregarDados() {
  const resposta = await fetch("http://localhost:3000/files");
  const dados = await resposta.json();
  console.log(dados);
}
carregarDados();
