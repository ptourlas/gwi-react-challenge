import * as React from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  type DialogProps,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";

export type RouterModalProps = {
  children: React.ReactNode;
  title?: React.ReactNode;
  maxWidth?: DialogProps["maxWidth"];
  fullWidth?: boolean;
  showCloseWhenNoTitle?: boolean;
};

export default function Modal({
  children,
  title,
  maxWidth = "md",
  fullWidth = true,
  showCloseWhenNoTitle = true,
}: RouterModalProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const goBack = React.useCallback(() => {
    // If there’s no history (e.g. opened directly), fall back to home.
    if (window.history.state && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleClose: DialogProps["onClose"] = () => {
    goBack();
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby={title ? "router-modal-title" : undefined}
      // Optional for tests
      data-testid="router-modal"
    >
      {title ? (
        <DialogTitle id="router-modal-title" sx={{ pr: 6 }}>
          {title}
          <IconButton
            onClick={goBack}
            aria-label="Close"
            edge="end"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      ) : showCloseWhenNoTitle ? (
        <IconButton
          onClick={goBack}
          aria-label="Close"
          edge="end"
          sx={{ position: "absolute", right: 8, top: 8, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}

      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  );
}
