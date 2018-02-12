import moment from 'moment';
import { NORMAL_TXN_TYPE, INSTALLMENTS_TXN_TYPE } from '../constants';

function isNormalTransaction(txn) {
  return txn.type === NORMAL_TXN_TYPE;
}

function isInstallmentTransaction(txn) {
  return txn.type === INSTALLMENTS_TXN_TYPE;
}

function isNonInitialInstallmentTransaction(txn) {
  return isInstallmentTransaction(txn) && txn.installments && txn.installments.number > 1;
}

function isInitialInstallmentTransaction(txn) {
  return isInstallmentTransaction(txn) && txn.installments && txn.installments.number === 1;
}

export function fixInstallments(txns) {
  return txns.map((txn) => {
    const clonedTxn = Object.assign({}, txn);
    if (isNonInitialInstallmentTransaction(clonedTxn)) {
      const dateMoment = moment(clonedTxn.date);
      const actualDateMoment = dateMoment.add(clonedTxn.installments.number - 1, 'month');
      clonedTxn.date = actualDateMoment.toISOString();
    }
    return clonedTxn;
  });
}

export function sortTransactionsByDate(txns) {
  const cloned = Array.from(txns);
  cloned.sort((txn1, txn2) => {
    if (txn1.date === txn2.date) {
      return 0;
    }
    return txn1.date < txn2.date ? -1 : 1;
  });

  return cloned;
}

export function filterOldTransactions(txns, startMoment, combineInstallments) {
  return txns.filter((txn) => {
    const combineNeededAndInitialOrNormal =
      combineInstallments && (isNormalTransaction(txn) || isInitialInstallmentTransaction(txn));
    return (!combineInstallments && startMoment.isSameOrBefore(txn.processedDate)) ||
           (combineNeededAndInitialOrNormal && startMoment.isSameOrBefore(txn.date));
  });
}
