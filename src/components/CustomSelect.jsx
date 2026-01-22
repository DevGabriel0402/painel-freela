import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { ChevronDown, Check } from "lucide-react";

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectTrigger = styled.div`
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
  min-height: 44px; /* Match input height */
  box-sizing: border-box;

  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentSoft};
  }
`;

const SelectValue = styled.span`
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme, $isPlaceholder }) => ($isPlaceholder ? theme.colors.muted : theme.colors.text)};
`;

const OptionsList = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  z-index: 50;
  max-height: 250px;
  overflow-y: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: fadeIn 0.15s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const OptionItem = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme, $isSelected }) => ($isSelected ? theme.colors.accentText : theme.colors.text)};
  background: ${({ theme, $isSelected }) => ($isSelected ? theme.colors.accent : "transparent")};
  transition: background 0.1s ease;

  &:hover {
    background: ${({ theme, $isSelected }) => ($isSelected ? theme.colors.accent : theme.colors.surface2)};
  }
`;

export default function CustomSelect({ value, onChange, options = [], placeholder = "Selecione", disabled }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((o) => String(o.value) === String(value));

    function handleSelect(val) {
        if (disabled) return;
        onChange({ target: { value: val } }); // Mock event object for compatibility
        setIsOpen(false);
    }

    return (
        <SelectContainer ref={containerRef}>
            <SelectTrigger $isOpen={isOpen} onClick={() => !disabled && setIsOpen(!isOpen)} style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
                <SelectValue $isPlaceholder={!selectedOption}>
                    {selectedOption ? selectedOption.label : placeholder}
                </SelectValue>
                <ChevronDown size={16} style={{ opacity: 0.6, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </SelectTrigger>

            {isOpen && !disabled && (
                <OptionsList>
                    {options.map((option) => (
                        <OptionItem
                            key={option.value}
                            $isSelected={String(option.value) === String(value)}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                            {String(option.value) === String(value) && <Check size={14} />}
                        </OptionItem>
                    ))}
                    {options.length === 0 && (
                        <div style={{ padding: 10, textAlign: 'center', fontSize: 13, opacity: 0.6 }}>Sem opções</div>
                    )}
                </OptionsList>
            )}
        </SelectContainer>
    );
}
