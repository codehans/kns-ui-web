import { atom, useAtom } from "jotai"
import * as React from "react"
import Modal from "react-bootstrap/Modal"
import Form from "react-bootstrap/Form"
import { globalRefreshAtom, registrySignerAtom, showReverseModalAtom } from "../lib/data"

const nameAtom = atom("")

const SetReverseModal = () => {
  const [registrySigner] = useAtom(registrySignerAtom)
  const [show, setShow] = useAtom(showReverseModalAtom)
  const [name, setName] = useAtom(nameAtom)
  const [globalRefresh] = useAtom(globalRefreshAtom)
  
  const handleSet = (event) => {
    event.preventDefault()
    if (registrySigner) {
      registrySigner
        .setKujiraAddr({ name: name })
          .then(globalRefresh.refresh)
          .then(() => setShow(false))
          .catch(console.log)
    }
  }
  const handleChange = (event) => {
    setName(event.target.value)
  }

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header>
        <h4 className="color-white mb-0">Set Reverse Record</h4>
      </Modal.Header>
      <Modal.Body>
        <p className="color-white">
          A reverse record links your wallet address to a domain you own.
          This record is used to discover your display name, which will replace
          your wallet address in the top right selector and can be used to
          identify you in other apps.
          <br/><br/>
          Register your domain with an Address record pointing to your wallet
          and then set a reverse record below.
        </p>
        <Form onSubmit={handleSet}>
          <Form.Control type="text" placeholder="domain.kuji" value={name} className="md-input text-light bg-dark" onChange={handleChange}/>
          <button className="md-button md-button--full mt-1" type="submit">Set Reverse Record</button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default SetReverseModal