import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import Helmet from 'react-helmet';

import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

const quickSelectButtons = [
  {
    label: 'today',
    getRange: () => {
      const today = moment();
      return [today, today];
    },
  },
  {
    label: 'yesterday',
    getRange: () => {
      const yesterday = moment().subtract(1, 'day');
      return [yesterday, yesterday];
    },
  },
  {
    label: 'last 7 days',
    getRange: () => {
      const end = moment();
      const start = moment(end).subtract(1, 'week');
      return [start, end];
    },
  },
  {
    label: 'this week',
    getRange: () => {
      const end = moment();
      const start = moment(end).day(1);
      return [start, end];
    },
  },
  {
    label: 'this month',
    getRange: () => {
      const end = moment();
      const start = moment(end).date(1);
      return [start, end];
    },
  },
  {
    label: 'previous month',
    getRange: () => {
      const end = moment()
        .date(1)
        .subtract(1, 'day');
      const start = moment(end).date(1);
      return [start, end];
    },
  },
  {
    label: 'this year',
    getRange: () => {
      const end = moment();
      const start = moment(end).dayOfYear(1);
      return [start, end];
    },
  },
];

export default class Example extends React.Component {
  constructor(props) {
    super(props);
    this.handleDayClick = this.handleDayClick.bind(this);
    this.handleDayMouseEnter = this.handleDayMouseEnter.bind(this);
    this.state = this.getInitialState();
  }
  getInitialState() {
    return {
      from: null,
      to: null,
      enteredTo: null, // Keep track of the last day for mouseEnter.
      startMonth: null,
      endMonth: null,
    };
  }
  isSelectingFirstDay(from, to, day) {
    const isBeforeFirstDay = from && DateUtils.isDayBefore(day, from);
    const isRangeSelected = from && to;
    return !from || isBeforeFirstDay || isRangeSelected;
  }
  isValid = day => {
    const { min, max } = this.props;
    const overMinimum = !min || day >= min;
    const underMaximum = !max || day <= max;

    return overMinimum && underMaximum;
  };
  handleDayClick(day) {
    if (this.isValid(day)) {
      const { from, to } = this.state;

      if (this.isSelectingFirstDay(from, to, day)) {
        this.setState({
          from: day,
          to: null,
          enteredTo: null,
        });
      } else {
        this.setState({
          to: day,
          enteredTo: day,
          startMonth: from,
          endMonth: day,
        });
      }
    }
  }
  handleDayMouseEnter(day) {
    const { from, to } = this.state;
    if (!this.isSelectingFirstDay(from, to, day) && this.isValid(day)) {
      this.setState({
        enteredTo: day,
      });
    }
  }
  selectRange = (from, to) => {
    const { min, max } = this.props;
    const validFrom = (min ? moment.max(from, moment(min)) : from).toDate();
    const validTo = (max ? moment.min(to, moment(max)) : to).toDate();

    this.setState({
      from: validFrom,
      to: validTo,
      enteredTo: validTo,
      startMonth: validFrom,
      endMonth: validTo,
    });
  };
  render() {
    const { min, max } = this.props;
    const { from, to, enteredTo, startMonth, endMonth } = this.state;
    const modifiers = { start: from, end: to };
    const disabledDays = {
      after: max,
      before: min,
    };
    const selectedDays = [from, { from, to: enteredTo }];
    const sharedProps = {
      className: 'Range',
      selectedDays,
      disabledDays,
      modifiers,
      onDayClick: this.handleDayClick,
      onDayMouseEnter: this.handleDayMouseEnter,
      firstDayOfWeek: 1,
    };
    return (
      <div>
        <DayPicker
          {...sharedProps}
          onMonthChange={month => {
            this.setState({ startMonth: month });
          }}
          month={startMonth}
        />
        <DayPicker
          {...sharedProps}
          onMonthChange={month => {
            this.setState({ endMonth: month });
          }}
          month={endMonth}
        />
        <div style={{ display: 'inline-block' }}>
          {quickSelectButtons.map(({ label, getRange }) => (
            <button
              key={label}
              style={{ display: 'block' }}
              onClick={() => {
                this.selectRange(...getRange());
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <Helmet>
          <style>{`
  .Range .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
    background-color: #f0f8ff !important;
    color: #4a90e2;
  }
  .Range .DayPicker-Day {
    border-radius: 0 !important;
  }
`}</style>
        </Helmet>
      </div>
    );
  }
}

Example.propTypes = {
  from: PropTypes.instanceOf(Date),
  to: PropTypes.instanceOf(Date),
  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),
};

Example.defaultProps = {
  // min: null,
  // max: null,
  min: moment('2018-05-06')
    .hours(12)
    .toDate(),
  max: moment('2018-08-08')
    .hours(12)
    .toDate(),
};
