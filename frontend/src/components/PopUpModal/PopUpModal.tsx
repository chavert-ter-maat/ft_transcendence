import './popUpModal.css'

function PopUpModal({ modal, setModal }) {
  return (
    <div>
      <div className='pop-up-bg'>
        <div className='pop-up-modal'>
          <span className='pop-up-close' onClick={() => setModal({ ...modal, show: false })}>x</span>
          <span className='pop-up-title'>{modal.isError ? "Error" : "Info"}</span>
          <p className='pop-up-content'>{modal.content}</p>
        </div>
      </div>
    </div>
  )
}

export default PopUpModal