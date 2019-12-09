import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ControlledModal } from './../Modal/ControlledModal';
import { Button } from 'fundamental-react/Button';
import LuigiClient from '@kyma-project/luigi-client';

const ModalWithForm = ({
  performRefetch,
  sendNotification,
  title,
  button,
  confirmText,
  initialIsValid,
  children,
  modalClassName,
}) => {
  const [isOpen, setOpen] = useState(false);
  const [isValid, setValid] = useState(initialIsValid);
  const formElementRef = useRef(null);

  React.useEffect(() => {
    if (formElementRef.current) {
      const observer = new MutationObserver((a, b) => console.log(a, b));
      observer.observe(formElementRef.current, {
        childList: true,
        subtree: true,
      });
      return () => observer.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formElementRef.current]);

  const setOpenStatus = status => {
    if (status) {
      LuigiClient.uxManager().addBackdrop();
    } else {
      LuigiClient.uxManager().removeBackdrop();
    }
    setOpen(status);
  };

  const handleFormChanged = e => {
    setValid(formElementRef.current.checkValidity());
    if (typeof e.target.reportValidity === 'function') {
      // for IE
      e.target.reportValidity();
    }
  };

  const handleFormError = (title, message) => {
    sendNotification({
      variables: {
        content: message,
        title: title,
        color: '#BB0000',
        icon: 'decline',
      },
    });
  };

  const handleFormSuccess = (title, message) => {
    sendNotification({
      variables: {
        content: message,
        title: title,
        color: '#107E3E',
        icon: 'accept',
      },
    });

    performRefetch();
  };

  return (
    <ControlledModal
      modalOpeningComponent={
        <Button
          glyph={button.glyph || null}
          option={button.option}
          onClick={() => {
            setOpenStatus(true);
          }}
        >
          {button.text}
        </Button>
      }
      modalClassName={modalClassName}
      show={isOpen}
      actions={
        <React.Fragment>
          <Button
            onClick={() => {
              setOpenStatus(false);
            }}
            option="light"
          >
            Cancel
          </Button>
          <Button
            aria-disabled={!isValid}
            onClick={() => {
              const form = formElementRef.current;
              if (
                typeof form.reportValidity === 'function'
                  ? form.reportValidity()
                  : form.checkValidity() // IE workaround; HTML validation tooltips won't be visible
              ) {
                form.dispatchEvent(new Event('submit'));
                setOpenStatus(false);
              }
            }}
            option="emphasized"
          >
            {confirmText}
          </Button>
        </React.Fragment>
      }
      onClose={() => {
        setOpenStatus(false);
      }}
      title={title}
    >
      {React.createElement(children.type, {
        formElementRef,
        isValid,
        onChange: handleFormChanged,
        onError: handleFormError,
        onCompleted: handleFormSuccess,
        ...children.props,
      })}
    </ControlledModal>
  );
};

ModalWithForm.propTypes = {
  performRefetch: PropTypes.func.isRequired,
  sendNotification: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  initialIsValid: PropTypes.bool,
  button: PropTypes.exact({
    text: PropTypes.string.isRequired,
    glyph: PropTypes.string,
    option: PropTypes.oneOf(['emphasized', 'light']),
  }).isRequired,
  children: PropTypes.node.isRequired,
  modalClassName: PropTypes.string,
};
ModalWithForm.defaultProps = {
  sendNotification: () => {},
  performRefetch: () => {},
  initialIsValid: false,
};

export default ModalWithForm;
