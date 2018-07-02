import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import Helmet from 'react-helmet';

import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

const getDate = date =>
  moment(date)
    .hours(12)
    .minutes(0)
    .seconds(0)
    .milliseconds(0);

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

export default class CalendarRangePicker extends React.Component {
  static getDerivedStateFromPropsX(props) {
    const { min, max, from, to } = props;
    const [mMin, mMax] = [min, max].map(date => (date ? getDate(date) : date));
    let [mFrom, mTo] = [from, to].map(getDate);

    if (mMin) {
      mFrom = moment.max(mFrom, mMin);
    }

    if (mMax) {
      mTo = moment.min(mTo, mMax);
    }

    const firstCalendarMonth = mFrom;
    const secondCalendarMonth = CalendarRangePicker.getSecondCalendarMonth(
      mTo,
      firstCalendarMonth
    );

    return {
      min: mMin.toDate(),
      max: mMax.toDate(),
      from: mFrom.toDate(),
      to: mTo.toDate(),
      firstCalendarMonth: firstCalendarMonth.toDate(),
      secondCalendarMonth,
      enteredTo: mTo.toDate(),
    };
  }

  static isSelectingFirstDay(from, to, day) {
    const isBeforeFirstDay = from && DateUtils.isDayBefore(day, from);
    const isRangeSelected = from && to;
    return !from || isBeforeFirstDay || isRangeSelected;
  }

  /**
   * Calculates month used by second calendar
   * @param {moment.Moment} to End of date range
   * @param {moment.Moment|Date} firstCalendarMonth Month used by first calendar
   * @return {Date} Second calendar month
   */
  static getSecondCalendarMonth(to, firstCalendarMonth) {
    return moment.max(to, moment(firstCalendarMonth).add(1, 'month')).toDate();
  }

  constructor(props) {
    super(props);
    this.state = CalendarRangePicker.getDerivedStateFromPropsX(props);
  }

  isValid = day => {
    const { min, max } = this.state;
    const overMinimum = !min || day >= min;
    const underMaximum = !max || day <= max;

    return overMinimum && underMaximum;
  };

  handleDayClick = day => {
    console.log({
      isValid: this.isValid(day),
      day,
    });
    if (this.isValid(day)) {
      const { from, to } = this.state;

      console.log({
        from,
        to,
      });
      if (CalendarRangePicker.isSelectingFirstDay(from, to, day)) {
        this.setState({
          from: day,
          to: null,
          enteredTo: null,
        });
      } else {
        this.setState({
          to: day,
          enteredTo: day,
          firstCalendarMonth: from,
          secondCalendarMonth: CalendarRangePicker.getSecondCalendarMonth(
            moment(day),
            from
          ),
        });
      }
    }
  };

  handleDayMouseEnter = day => {
    const { from, to } = this.state;
    if (
      !CalendarRangePicker.isSelectingFirstDay(from, to, day) &&
      this.isValid(day)
    ) {
      this.setState({
        enteredTo: day,
      });
    }
  };

  selectRange = (from, to) => {
    const { min, max } = this.props;
    const validFrom = (min ? moment.max(from, moment(min)) : from).toDate();
    const validTo = (max ? moment.min(to, moment(max)) : to).toDate();

    this.setState({
      from: validFrom,
      to: validTo,
      enteredTo: validTo,
      firstCalendarMonth: validFrom,
      secondCalendarMonth: CalendarRangePicker.getSecondCalendarMonth(
        moment(validTo),
        validFrom
      ),
    });
  };

  render() {
    const {
      min,
      max,
      from,
      to,
      enteredTo,
      firstCalendarMonth,
      secondCalendarMonth,
    } = this.state;
    const modifiers = { start: from, end: to };
    const disabledDays = {
      after: max,
      before: min,
    };
    const selectedDays = [from, { from, to: enteredTo }];
    const firstCalendarToLimit = moment(secondCalendarMonth)
      .subtract(1, 'month')
      .toDate();
    const secondCalendarFromLimit = moment(firstCalendarMonth)
      .add(1, 'month')
      .toDate();
    const sharedProps = {
      className: 'Range',
      selectedDays,
      disabledDays,
      modifiers,
      onDayClick: this.handleDayClick,
      onDayMouseEnter: this.handleDayMouseEnter,
      firstDayOfWeek: 1,
      showOutsideDays: true,
    };

    return (
      <div>
        <DayPicker
          {...sharedProps}
          fromMonth={min}
          toMonth={firstCalendarToLimit}
          onMonthChange={month => {
            this.setState({ firstCalendarMonth: month });
          }}
          month={firstCalendarMonth}
        />
        <DayPicker
          {...sharedProps}
          fromMonth={secondCalendarFromLimit}
          toMonth={max}
          onMonthChange={month => {
            this.setState({ secondCalendarMonth: month });
          }}
          month={secondCalendarMonth}
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

CalendarRangePicker.propTypes = {
  from: PropTypes.instanceOf(Date),
  to: PropTypes.instanceOf(Date),
  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),
};

CalendarRangePicker.defaultProps = {
  // min: null,
  // max: null,
  min: new Date('2018-05-06'),
  max: new Date('2018-08-08'),
  from: new Date('2018-08-05'),
  to: new Date('2018-08-07'),
};
