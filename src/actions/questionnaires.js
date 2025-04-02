import {
  REQUEST_QUESTIONNAIRES,
  RECEIVE_QUESTIONNAIRES,
  ANSWER_QUESTION,
  RECEIVE_QUESTIONNAIRE_RESULT,
  START_ASSESSMENT,
  RECEIVE_ASSESSMENT,
} from '../constants/actionType';
import api from '../api/questionnaires';

// request questionnaires
const requestQuestionnaires = () => ({
  type: REQUEST_QUESTIONNAIRES,
});

const receiveQuestionnaires = data => ({
  type: RECEIVE_QUESTIONNAIRES,
  payload: data,
});

// start assessment
const receiveAssessment = data => ({
  type: RECEIVE_ASSESSMENT,
  payload: data,
});

export const startAssessment = (id) => async dispatch => {
  const response = await api.startAssessment(id);
  return dispatch(receiveAssessment(response));
};

export const fetchQuestionnaires = () => async dispatch => {
  dispatch(requestQuestionnaires());
  const response = await api.fetchQuestionnaires();
  return dispatch(receiveQuestionnaires(response));
};

// answer one question
export const answer = (questionnaireId, questionId, selectedIds) => ({
  type: ANSWER_QUESTION,
  payload: {
    questionnaireId,
    questionId,
    selectedIds,
  },
});

const receiveQuestionnaireResult = data => ({
  type: RECEIVE_QUESTIONNAIRE_RESULT,
  payload: data,
});

// complete one questionnaire
export const complete = questionnaireId => async dispatch => {
  const response = await api.completeQuestionnaire(questionnaireId)
  return dispatch(receiveQuestionnaireResult(response));
};
