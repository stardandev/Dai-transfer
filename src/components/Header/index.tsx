import * as React from "react";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import { formatEther } from "@ethersproject/units";
import { AppBar, Box, Toolbar, Typography, Button, Modal } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { injectedConnector, walletconnect } from "../../connectors";
import { fetcher } from "../../functions";
import ERC20ABI from "../../abi/ERC20.abi.json";

const useStyles = makeStyles({
  button: {
    width: "100%",
    marginTop: "10px !important",
  },
  accountInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
});

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function ButtonAppBar() {
  const { chainId, account, activate, deactivate, library } = useWeb3React();
  const [open, setOpen] = React.useState<boolean>(false);
  const classes = useStyles();

  const { data: balance, mutate } = useSWR(["getBalance", account, "latest"], {
    fetcher: fetcher(library, ERC20ABI),
  });
  React.useEffect(() => {
    if (chainId && chainId !== 3) {
      alert("We only use the Ropsten Test Network");
      deactivate();
    }
  }, [account, chainId, deactivate]);
  React.useEffect(() => {
    library?.on("block", () => {
      mutate(undefined, true);
    });
    return () => {
      library?.removeAllListeners("block");
    };
  }, [library, mutate]);

  const onConnectWallet = () => {
    setOpen(true);
  };
  const onConnectMetaMask = () => {
    activate(injectedConnector);
    handleClose();
  };
  const onConnectWalletConnect = () => {
    activate(walletconnect);
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Advanced Defi
          </Typography>
          {account === undefined ? (
            <Button variant="contained" size="medium" onClick={onConnectWallet}>
              Connect Wallet
            </Button>
          ) : (
            <div className={classes.accountInfo}>
              <Typography variant="subtitle1" component="p">
                {account}
              </Typography>
              {balance && (
                <Typography variant="subtitle1" component="p">
                  {parseFloat(formatEther(balance)).toPrecision(4)} ETH
                </Typography>
              )}
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Button
            variant="contained"
            className={classes.button}
            onClick={onConnectMetaMask}
          >
            Connect MetaMask
          </Button>
          <Button
            variant="contained"
            className={classes.button}
            onClick={onConnectWalletConnect}
          >
            Connect WalletConnect
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
