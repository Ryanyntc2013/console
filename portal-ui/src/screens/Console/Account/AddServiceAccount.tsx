// This file is part of MinIO Console Server
// Copyright (c) 2021 MinIO, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";
import { Button, LinearProgress } from "@material-ui/core";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { modalBasic } from "../Common/FormComponents/common/styleLibrary";
import { NewServiceAccount } from "../Common/CredentialsPrompt/types";
import { setModalErrorSnackMessage } from "../../../actions";
import { ErrorResponseHandler } from "../../../common/types";
import ModalWrapper from "../Common/ModalWrapper/ModalWrapper";
import api from "../../../common/api";
import CodeMirrorWrapper from "../Common/FormComponents/CodeMirrorWrapper/CodeMirrorWrapper";
import FormSwitchWrapper from "../Common/FormComponents/FormSwitchWrapper/FormSwitchWrapper";
import InputBoxWrapper from "../Common/FormComponents/InputBoxWrapper/InputBoxWrapper";

const styles = (theme: Theme) =>
  createStyles({
    jsonPolicyEditor: {
      minHeight: 400,
      width: "100%",
    },
    buttonContainer: {
      textAlign: "right",
    },
    infoDetails: {
      color: "#393939",
      fontSize: 12,
      fontStyle: "italic",
      marginBottom: "8px",
    },
    containerScrollable: {
      maxHeight: "calc(100vh - 300px)" as const,
      overflowY: "auto" as const,
    },
    ...modalBasic,
  });

interface IAddServiceAccountProps {
  classes: any;
  open: boolean;
  closeModalAndRefresh: (res: NewServiceAccount | null) => void;
  setModalErrorSnackMessage: typeof setModalErrorSnackMessage;
}

const AddServiceAccount = ({
  classes,
  open,
  closeModalAndRefresh,
  setModalErrorSnackMessage,
}: IAddServiceAccountProps) => {
  const [addSending, setAddSending] = useState<boolean>(false);
  const [policyDefinition, setPolicyDefinition] = useState<string>("");
  const [accessKey, setAccessKey] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [isRestrictedByPolicy, setIsRestrictedByPolicy] =
    useState<boolean>(false);
  const [addCredentials, setAddCredentials] = useState<boolean>(false);

  useEffect(() => {
    if (addSending) {
      if (addCredentials) {
        api
          .invoke("POST", `/api/v1/service-account-credentials`, {
            policy: policyDefinition,
            accessKey: accessKey,
            secretKey: secretKey,
          })
          .then((res) => {
            setAddSending(false);
            closeModalAndRefresh(res);
          })
          .catch((err: ErrorResponseHandler) => {
            setAddSending(false);
            setModalErrorSnackMessage(err);
          });
      } else {
        api
          .invoke("POST", `/api/v1/service-accounts`, {
            policy: policyDefinition,
          })
          .then((res) => {
            setAddSending(false);
            closeModalAndRefresh(res);
          })
          .catch((err: ErrorResponseHandler) => {
            setAddSending(false);
            setModalErrorSnackMessage(err);
          });
      }
    }
  }, [
    addSending,
    setAddSending,
    setModalErrorSnackMessage,
    policyDefinition,
    closeModalAndRefresh,
    addCredentials,
    accessKey,
    secretKey,
  ]);

  const addServiceAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAddSending(true);
  };

  const resetForm = () => {
    setPolicyDefinition("");
  };

  return (
    <ModalWrapper
      modalOpen={open}
      onClose={() => {
        closeModalAndRefresh(null);
      }}
      title={`Create Service Account`}
    >
      <form
        noValidate
        autoComplete="off"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          addServiceAccount(e);
        }}
      >
        <Grid container className={classes.containerScrollable}>
          <Grid item xs={12}>
            <div className={classes.infoDetails}>
              Service Accounts inherit the policy explicitly attached to the
              parent user and the policy attached to each group in which the
              parent user has membership. You can specify an optional
              JSON-formatted policy below to restrict the Service Account access
              to a subset of actions and resources explicitly allowed for the
              parent user. You cannot modify the Service Account optional policy
              after saving.
            </div>
          </Grid>
          <Grid item xs={12}>
            <FormSwitchWrapper
              value="locking"
              id="locking"
              name="locking"
              checked={isRestrictedByPolicy}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setIsRestrictedByPolicy(event.target.checked);
              }}
              label={"Restrict with policy"}
              indicatorLabels={["On", "Off"]}
            />
            <FormSwitchWrapper
              value="locking"
              id="locking"
              name="locking"
              checked={addCredentials}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setAddCredentials(event.target.checked);
              }}
              label={"Customize Credentials"}
              indicatorLabels={["On", "Off"]}
            />
          </Grid>
          {isRestrictedByPolicy && (
            <Grid item xs={12}>
              <CodeMirrorWrapper
                value={policyDefinition}
                onBeforeChange={(editor, data, value) => {
                  setPolicyDefinition(value);
                }}
              />
            </Grid>
          )}
          {addCredentials && (
            <Grid item xs={12}>
              <InputBoxWrapper
                value={accessKey}
                label={"Access Key"}
                id={"accessKey"}
                name={"accessKey"}
                placeholder={"Enter Access Key"}
                onChange={(e) => {
                  setAccessKey(e.target.value);
                }}
              />
              <InputBoxWrapper
                value={secretKey}
                label={"Secret Key"}
                id={"secretKey"}
                name={"secretKey"}
                placeholder={"Enter Secret Key"}
                onChange={(e) => {
                  setSecretKey(e.target.value);
                }}
              />
            </Grid>
          )}
        </Grid>
        <Grid container>
          <Grid item xs={12} className={classes.buttonContainer}>
            <button
              type="button"
              color="primary"
              className={classes.clearButton}
              onClick={resetForm}
            >
              Clear
            </button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={addSending}
            >
              Create
            </Button>
          </Grid>
          {addSending && (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          )}
        </Grid>
      </form>
    </ModalWrapper>
  );
};

const mapDispatchToProps = {
  setModalErrorSnackMessage,
};

const connector = connect(null, mapDispatchToProps);

export default withStyles(styles)(connector(AddServiceAccount));
