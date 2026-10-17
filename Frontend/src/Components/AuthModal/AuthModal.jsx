import { Modal } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { SignIn, SignUp } from '../../pages/Auth/Auth';
import { useState } from 'react';
import './AuthModal.scss';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const [view, setView] = useState('signin'); // 'signin' | 'signup'

  if (!isAuthModalOpen) return null;

  return (
    <Modal
      open={isAuthModalOpen}
      onCancel={closeAuthModal}
      footer={null}
      centered
      width="90vw"
      style={{ maxWidth: 420, top: 0, paddingBottom: 0 }}
      destroyOnClose
      className="ant-auth-modal-wrapper"
      wrapClassName="ant-auth-modal-wrap"
    >
      <div className="auth-modal-inner">
        {view === 'signin' ? (
          <SignIn isModalMode={true} onSuccess={closeAuthModal} />
        ) : (
          <SignUp isModalMode={true} onSuccess={closeAuthModal} />
        )}
      </div>
      <div className="auth-modal-bottom-strip">
        <span>{view === 'signin' ? "Don't have an account?" : "Already have an account?"}</span>
        <button type="button" className="btn-link-toggle" onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}>
          {view === 'signin' ? 'Create an Account >' : 'Sign In >'}
        </button>
      </div>
    </Modal>
  );
};

export default AuthModal;
