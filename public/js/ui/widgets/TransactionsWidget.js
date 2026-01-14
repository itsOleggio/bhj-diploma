/**
 * Класс TransactionsWidget отвечает за
 * открытие всплывающих окон для
 * создания нового дохода или расхода
 * */

class TransactionsWidget {
  /**
   * Устанавливает полученный элемент
   * в свойство element.
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * */
  constructor( element ) {
    if(!element){
      throw new Error('Нет такого элемента');
    } 
    this.element = element;
    this.registerEvents();
  }
  /**
   * Регистрирует обработчики нажатия на
   * кнопки «Новый доход» и «Новый расход».
   * При нажатии вызывает Modal.open() для
   * экземпляра окна
   * */
registerEvents() {
    const btnCreateIncome = this.element.querySelector('.create-income-button');
    const btnCreateExpense = this.element.querySelector('.create-expense-button');

    btnCreateIncome.addEventListener('click', () => {
      App.getModal('newIncome').open();
    });

    btnCreateExpense.addEventListener('click', () => {
      App.getModal('newExpense').open();
    });
  }
}
