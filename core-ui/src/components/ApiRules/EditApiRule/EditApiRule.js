import React from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import LuigiClient from '@kyma-project/luigi-client';

import { Spinner } from 'react-shared';
import { useNotification } from '../../../contexts/notifications';
import { UPDATE_API_RULE } from '../../../gql/mutations';
import { GET_API_RULE } from '../../../gql/queries';
import ApiRuleForm from '../ApiRuleForm/ApiRuleForm';

export default function EditApiRule({ apiName }) {
  const [updateApiRuleMutation] = useMutation(UPDATE_API_RULE, {
    onError: handleError,
    onCompleted: handleSuccess,
  });
  const notificationManager = useNotification();

  const { error, loading, data } = useQuery(GET_API_RULE, {
    variables: {
      namespace: LuigiClient.getContext().namespaceId,
      name: apiName,
    },
  });

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <h1>Couldn't fetch API rule data</h1>;
  }

  data.APIRule.rules.forEach(rule => {
    delete rule.__typename;
    rule.accessStrategies.forEach(as => {
      delete as.__typename;
    });
  });

  function handleError(error) {
    notificationManager.notify({
      content: `Could not update API Rule: ${error.message}`,
      title: 'Error',
      color: '#BB0000',
      icon: 'decline',
      autoClose: false,
    });
  }

  function handleSuccess(data) {
    const editedApiRuleData = data.updateAPIRule;

    if (editedApiRuleData) {
      notificationManager.notify({
        content: `API Rule ${editedApiRuleData.name} updated successfully`,
        title: 'Success',
        color: '#107E3E',
        icon: 'accept',
        autoClose: true,
      });
    }
  }

  return (
    <ApiRuleForm
      apiRule={data.APIRule}
      mutation={updateApiRuleMutation}
      saveButtonText="Save"
      headerTitle={`Edit ${apiName}`}
    />
  );
}