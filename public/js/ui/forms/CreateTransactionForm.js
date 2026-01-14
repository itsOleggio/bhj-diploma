/**
 * Класс CreateTransactionForm управляет формой
 * создания новой транзакции
 * */
const modal = new Modal(document.getElementById("modal-register"));
class CreateTransactionForm extends AsyncForm {
  /**
   * Вызывает родительский конструктор и
   * метод renderAccountsList
   * */
  constructor(element) {
    super(element);
    this.renderAccountsList();
  }

  /**
   * Получает список счетов с помощью Account.list
   * Обновляет в форме всплывающего окна выпадающий список
   * */
  renderAccountsList() {
    const select = this.element.querySelector('select[name="account_id"]');

    select.innerHTML = "";

    Account.list({}, (err, response) => {
      if (err || !response || !response.data) {
        return;
      }

      response.data.forEach((account) => {
        const option = document.createElement("option");
        option.value = account.id;
        option.textContent = account.name;
        select.appendChild(option);
      });
    });
  }

  /**
   * Создаёт новую транзакцию (доход или расход)
   * с помощью Transaction.create. По успешному результату
   * вызывает App.update(), сбрасывает форму и закрывает окно,
   * в котором находится форма
   * */
  onSubmit(data) {
    Transaction.create(data, () => {
      App.update();
      this.element.reset();
      modal.close();
    });
  }
}
