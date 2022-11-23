import './Titulo.css'

function Titulo() {
  return (
    <div className="container-fluid bg-dark text-white">
      <div className="row align-items-center">
        <div className="col-sm-4 col-md-3 text-center">
          <img src="logo.png" alt="Logo da imob" className="logo" />
        </div>
        <div className="col-sm-8 col-md-6 text-center">
          <h1>Imobiliária</h1>          
        </div>
        <div className="col-sm-12 col-md-3 text-center">
          <h3>Temporada de Verão 2022</h3>
        </div>
      </div>
    </div>
  )
}

export default Titulo