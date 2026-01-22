import React, { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

// --- Styled Components (Sharing styles with CustomSelect where possible) ---

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const Trigger = styled.div`
  width: 100%;
  padding: 11px 12px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme, $isOpen }) => ($isOpen ? theme.colors.accent : theme.colors.border)};
  background: ${({ theme }) => theme.colors.surface2};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  min-height: 44px;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentSoft};
  }
`;

const ValueText = styled.span`
  font-size: 14px;
  color: ${({ theme, $isPlaceholder }) => ($isPlaceholder ? theme.colors.muted : theme.colors.text)};
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  z-index: 50;
  padding: 16px;
  width: 100%;
  min-width: 280px; /* Ensure calendar is readable */
  
  /* Prevent overflow off-screen on mobile */
  @media (max-width: 400px) {
    min-width: 260px;
  }
  
  animation: fadeIn 0.15s ease;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const HeaderTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  text-transform: capitalize;
`;

const NavButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  display: grid;
  place-items: center;
  padding: 4px;
  cursor: pointer;
  transition: all 0.1s;

  &:hover {
    background: ${({ theme }) => theme.colors.surface2};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
`;

const WeekDay = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 500;
  margin-bottom: 8px;
  text-transform: capitalize;
`;

const DayButton = styled.button`
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.text};
  position: relative;

  /* Not current month */
  ${({ $isCurrentMonth, theme }) => !$isCurrentMonth && css`
    color: ${theme.colors.muted};
    opacity: 0.5;
  `}

  /* Today */
  ${({ $isToday, $isSelected, theme }) => $isToday && !$isSelected && css`
    color: ${theme.colors.accent};
    font-weight: 700;
    &::after {
      content: '';
      position: absolute;
      bottom: 4px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: ${theme.colors.accent};
    }
  `}

  /* Selected */
  ${({ $isSelected, theme }) => $isSelected && css`
    background: ${theme.colors.accent};
    color: ${theme.colors.accentText} !important;
    font-weight: 600;
  `}

  &:hover {
    ${({ $isSelected, theme }) => !$isSelected && css`
       background: ${theme.colors.surface2};
    `}
  }
`;

export default function CustomDatePicker({ value, onChange, placeholder = "Selecione a data", disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial value or default to Today for "current view"
  const dateValue = value ? parseISO(value) : null;
  const [currentMonth, setCurrentMonth] = useState(dateValue || new Date());

  useEffect(() => {
    // Sync internal view if value changes externally
    if (value) {
      setCurrentMonth(parseISO(value));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handlePrevMonth() {
    setCurrentMonth(subMonths(currentMonth, 1));
  }

  function handleNextMonth() {
    setCurrentMonth(addMonths(currentMonth, 1));
  }

  function handleSelectDate(day) {
    if (disabled) return;
    // Format to YYYY-MM-DD for standard input compatibility
    const formatted = format(day, "yyyy-MM-dd");
    onChange({ target: { value: formatted } }); // Mock event
    setIsOpen(false);
  }

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

  // Formatted display text
  const displayText = dateValue
    ? format(dateValue, "dd 'de' MMM, yyyy", { locale: ptBR })
    : placeholder;

  return (
    <Container ref={containerRef}>
      <Trigger
        $isOpen={isOpen}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CalendarIcon size={16} style={{ opacity: 0.6 }} />
          <ValueText $isPlaceholder={!dateValue}>{displayText}</ValueText>
        </div>

        {/* Reuse existing logic or simple chevron */}
        {/* We can use opacity:0 to hide it if we want "no arrow" strictly, but user liked the select style */}
        {/* "sem a seta" was for native date input. For custom UI, an indicator is good. */}
        {/* I will replicate the CustomSelect chevron for consistency. */}
        <ChevronDown size={16} style={{ opacity: 0.6, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </Trigger>

      {isOpen && !disabled && (
        <Dropdown>
          <Header>
            <NavButton onClick={(e) => { e.stopPropagation(); handlePrevMonth(); }} type="button">
              <ChevronLeft size={16} />
            </NavButton>
            <HeaderTitle>
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </HeaderTitle>
            <NavButton onClick={(e) => { e.stopPropagation(); handleNextMonth(); }} type="button">
              <ChevronRight size={16} />
            </NavButton>
          </Header>

          <Grid>
            {weekDays.map(wd => <WeekDay key={wd}>{wd}</WeekDay>)}
            {days.map(day => {
              const isSelected = dateValue && isSameDay(day, dateValue);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isDayToday = isToday(day);

              return (
                <DayButton
                  key={day.toString()}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleSelectDate(day); }}
                  $isSelected={isSelected}
                  $isCurrentMonth={isCurrentMonth}
                  $isToday={isDayToday}
                >
                  {format(day, "d")}
                </DayButton>
              );
            })}
          </Grid>
        </Dropdown>
      )}
    </Container>
  );
}
