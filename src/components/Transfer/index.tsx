import * as React from "react";
import { useWeb3React } from "@web3-react/core";
import { formatEther, parseEther } from "@ethersproject/units";
import { Contract } from "@ethersproject/contracts";
import useSWR from "swr";
import {
  CssBaseline,
  Box,
  Container,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { fetcher } from "../../functions";
import { DAITokenAddress } from "../../utils";
import ERC20ABI from "../../abi/ERC20.abi.json";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginTop: 20,
  },
  balance: {
    marginLeft: "10px !important",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
  },
  button: {
    marginTop: "20px !important",
  },
});

export default function Transfer() {
  const classes = useStyles();
  const { account, library } = useWeb3React();
  const [amount, setAmount] = React.useState<string>("0");
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [txHash, setTxHash] = React.useState<string>("");
  const [recipientAddress, setRecipientAddress] = React.useState<string>("");
  const { data: balance, mutate } = useSWR(
    [DAITokenAddress, "balanceOf", account],
    {
      fetcher: fetcher(library, ERC20ABI),
    }
  );
  const formatFloat = (balance) => {
    return parseFloat(formatEther(balance || "0"));
  };
  const onSend = async () => {
    const ERC20Contract = new Contract(
      DAITokenAddress,
      ERC20ABI,
      library.getSigner()
    );

    let tx = await ERC20Contract.transfer(recipientAddress, parseEther(amount));
    setTxHash(tx.hash);
    setIsSending(true);
    await tx.wait();
    setIsSending(false);
  };
  const onViewEtherscan = async () => {
    window.open(`https://ropsten.etherscan.io/tx/${txHash}`, "_blink");
  };
  React.useEffect(() => {
    library?.on("block", () => {
      mutate(undefined, true);
    });
    return () => {
      library?.removeAllListeners("block");
    };
  }, [library, mutate, account]);
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box
          display="flex"
          justifyContent="center"
          flexDirection="column"
          alignItems="center"
          minHeight="100vh"
        >
          <div>
            <div className={classes.input}>
              <TextField
                label="Enter DAI Amount"
                variant="filled"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Typography className={classes.balance}>
                Balance: {formatFloat(balance).toFixed(4)} DAI
              </Typography>
            </div>
            <div className={classes.input}>
              <TextField
                label="Enter recipients address"
                variant="filled"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>
          </div>
          <div className={classes.buttonGroup}>
            <Button
              variant="contained"
              className={classes.button}
              disabled={
                parseFloat(amount) >= formatFloat(balance) ||
                amount === "0" ||
                !recipientAddress ||
                isSending
              }
              onClick={onSend}
            >
              {parseFloat(amount) >= formatFloat(balance) || amount === "0"
                ? "Input Valid Amount"
                : isSending
                ? "Sending..."
                : "Send"}
            </Button>
            {isSending && (
              <Button
                variant="contained"
                className={classes.button}
                onClick={onViewEtherscan}
              >
                VIEW ON ETHERSCAN
              </Button>
            )}
          </div>
        </Box>
      </Container>
    </React.Fragment>
  );
}
