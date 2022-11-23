import dbKnex from '../dados/db_config.js'
import md5 from 'md5'
import nodemailer from "nodemailer"

export const votoIndex = async (req, res) => {
  try {
    // obtém da tabela de votos todos os registros
    const alugueis = await dbKnex.select("a.*", "c.tipo as casas")
      .from("alugueis as a")
      .innerJoin("casas as c", { "a.casas_id": "c.id" })
    res.status(200).json(alugueis)
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

// async..await is not allowed in global scope, must use a wrapper
async function send_email(nome, email, hash) {

  // dados de configuração da conta de onde partirá os e-mails
  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "c89cb5717f3ba7",
      pass: "54bfd8146169f1"
    }
  });

  const link = "http://localhost:3001/votos/confirma/" + hash

  let mensa = `<p>Estimado sr(a): ${nome}</p>`
  mensa += `<p>Confirme o alguel do imóvel clicando no link a seguir:</p>`
  mensa += `<a href=${link}>Confirmação do Aluguel</a>`

  // send mail with defined transport object
  let info = await transport.sendMail({
    from: '"Imobliriária Satolep" <satolepimo@email.com>', // sender address
    to: email, // list of receivers
    subject: "Confirmação do Alguel", // Subject line
    text: `Para confirmar o aluguel do imóvel, copie e cole no browser o endereço ${link}`, // plain text body
    html: mensa, // html body
  });

}
//votos
export const votoStore = async (req, res) => {

  // atribui via desestruturação
  const { nome, email, casas_id } = req.body

  // se não informou estes atributos
  if (!nome || !email || !casas_id) {
    res.status(400).json({ id: 0, msg: "Erro... informe nome, email e candidata_id do voto" })
    return
  }

  try {
    // obtém da tabela de candidatas todos os registros da marca indicada
    const verifica = await dbKnex("alugueis").where({ email })

    // se a consulta retornou algum registro (significa que já votou)
    if (verifica.length > 0) {
      res.status(400).json({ id: 0, msg: "Erro... este e-mail já votou" })
      return
    }
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
    return
  }

  // gera um "hash" (código) que será utilizado no e-mail para o 
  // cliente confirmar o seu voto
  const hash = md5(email + casas_id + Date.now())

  try {
    // insere um registro na tabela de votos
    const novo = await dbKnex('alugueis').insert({ nome, email, casas_id, hash_conf: hash })

    // envia e-mail para que o cliente confirme o seu voto
    send_email(nome, email, hash).catch(console.error);

    // novo[0] => retorna o id do registro inserido                     
    res.status(201).json({ id: novo[0], msg: "Confirme o seu voto a partir da sua conta de e-mail" })
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const votoConfirme = async (req, res) => {

  // recebe o hash do voto
  const { hash } = req.params

  // para poder ser acessado fora do bloco
  let voto

  try {
    // obtém da tabela de votos o registro cujo hash é o que foi passado
    // no e-mail
    voto = await dbKnex("alugueis").where({ hash_conf: hash })

    // se a consulta não retornou algum registro 
    // (significa que o hash é inválido (o cliente poderia estar
    // tentado "burlar" o sistema))
    if (voto.length == 0) {
      res.status(400).json({ id: 0, msg: "Erro... copie corretamente o link" })
      return
    }
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
    return
  }

  // define (inicia) uma nova transação
  const trx = await dbKnex.transaction()

  try {
    // 1ª operação da transação
    const novo = await trx('alugueis')
      .where({ hash_conf: hash }).update({ confirmado: 1 })

    // 2ª operação da transação
    await trx("candidatas")
      .where({ id: voto[0].casas_id }).increment({ alugueis: 1 })

    // commit (grava) a transação
    await trx.commit()

    res.status(201).send("Ok! Voto confirmado com sucesso")
  } catch (error) {
    // rollback (volta) desfaz a operação realizada
    await trx.rollback()

    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const votoTotais = async (req, res) => {
  try {
    // obtém dados da tabela candidatas
    const consulta = await dbKnex("alugueis").select("confirmado")
      .count({ num: "*" }).groupBy("confirmado")
    res.status(200).json(consulta)
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const votoTotais2 = async (req, res) => {
  try {
    // obtém dados da tabela candidatas
    const consulta1 = await dbKnex("alugueis")
      .count({ num: "*" }).where({ confirmado: 1 })
    const consulta2 = await dbKnex("alugueis")
      .count({ num: "*" }).where({ confirmado: 0 })
    res.status(200).json({confirmados: consulta1[0].num, 
                          nao_confirmados: consulta2[0].num})
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}
