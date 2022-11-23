import { inAxios, webServiceURL } from "./config_axios";
import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import './Listagem.css'

function Listagem() {

  // declara uma variável (vetor) e a função que irá manipular
  // essa variável (o conteúdo inicial é o que está dentro () )
  const [rainhas, setRainhas] = useState([])
  const [show, setShow] = useState(false);
  const [id, setId] = useState(0);
  const [nome, setNome] = useState("");
  const [foto, setFoto] = useState("");
  const [idade, setIdade] = useState(0);
  const [clube, setClube] = useState("");
  const [cidade, setCidade] = useState("");
  const [nomeCli, setNomeCli] = useState("");
  const [emailCli, setEmailCli] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = (id, tipo, foto, data, endereco, cidade) => {
    setId(id)
    setNome(tipo)
    setFoto(webServiceURL + foto)
    setIdade(data)
    setClube(endereco)
    setCidade(cidade)
    setShow(true);
  }

  const getRainhas = async () => {
    try {
      // indica-se o método (get) para obter os dados do server
      const lista = await inAxios.get("candidatas")
      // modifica o valor da variável de estado (sempre pelo método)
      setRainhas(lista.data)
    } catch (erro) {
      console.log(`Erro no acesso ao Servidor ${erro}`)
    }
  }

  // executa uma função quando o componente é renderizado
  useEffect(() => {
    getRainhas()
  }, [])

  // verifica se os dados foram preenchidos e os envia para o Web Service
  const confirmarVoto = async () => {

    if (nomeCli == "" || emailCli == "") {
      alert("Por favor, informe os dados para confirmar o aluguel.")
      return
    }

    try {
      // indica-se o método (post) para enviar os dados para o server
      const voto = await inAxios.post("alugueis", { candidata_id: id, tipo: nomeCli, email: emailCli })
      // exibe a mensagem retornada pelo Web Service
      alert(voto.data.msg)
    } catch (erro) {
      console.log(`Erro no acesso ao Servidor ${erro}`)
    }

    // limpa os campos do formulário
    setNomeCli("")
    setEmailCli("")

    // fecha a janela modal
    setShow(false)
  }

  return (
    <div className="container py-3">
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3">
        {rainhas.map((rainha) => (
          <div className="col">
            <img src={`${webServiceURL}${rainha.foto}`} alt="Candidata" className="w-100 img-fluid" />
            <h4 className="mt-1">{rainha.tipo}
              <button className="btn btn-primary fw-bold py-2 px-4 float-end"
                onClick={() => handleShow(rainha.id, rainha.tipo, rainha.foto, rainha.data, rainha.endereco)}>
                Alugar
              </button>
            </h4>
            <h5 className="mb-5">{rainha.endereco} - {rainha.data} - Pelotas </h5>
          </div>
        ))}
      </div>

      <Modal show={show} onHide={handleClose} className="modal-lg">
        <Modal.Header closeButton>
          <Modal.Title>Imobiliária Satolep</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container-fluid">
            <div className="row">
              <div className="col-6">
                <img src={foto} alt={nome} className="img-fluid" />
              </div>
              <div className="col-6">
                <h2>{nome}</h2>
                <h5>Endereço: {clube}</h5>
                <h5>Liberada Apartir de: {idade} </h5>
                <h5>Cidade: Pelotas </h5>
                <h4 className="text-primary mt-5">Informe seus dados:</h4>
                <div class="form-floating mb-3">
                  <input type="text" class="form-control" id="floatingName" placeholder="Nome"
                    value={nomeCli} onChange={(e) => setNomeCli(e.target.value)} />
                  <label for="floatingName">Nome completo</label>
                </div>
                <div class="form-floating mb-3">
                  <input type="email" class="form-control" id="floatingEmail" placeholder="E-mail"
                    value={emailCli} onChange={(e) => setEmailCli(e.target.value)} />
                  <label for="floatingEmail">E-mail para contato</label>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmarVoto}>
            Confirmar Aluguel
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  )
}

export default Listagem