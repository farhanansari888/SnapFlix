import { InputWrapperProps } from "@/types/component";
import { isEmpty } from "@/utils/helpers";
import { Input, Button, ButtonProps, ButtonGroup, cn } from "@heroui/react";
import { useUncontrolled } from "@mantine/hooks";
import React, { CSSProperties, PropsWithChildren, useCallback } from "react";
import { kebabCase } from "string-ts";

// for tailwind css
[
  "border-warning",
  "border-primary",
  "border-secondary",
  "border-success",
  "border-danger",
  "border-default",
];

type WrapperProps = Omit<React.HTMLAttributes<HTMLDivElement>, "value" | "onChange"> &
  InputWrapperProps;

export interface SelectButtonProps<T extends string = string> extends WrapperProps {
  data: {
    label: string;
    value: T;
    disabled?: ButtonProps["disabled"];
    startContent?: ButtonProps["startContent"];
    endContent?: ButtonProps["endContent"];
  }[];
  value?: T;
  defaultValue?: T;
  allowDeselect?: boolean;
  groupType?: "connected" | "group" | "list";
  onChange?: (value: T | null) => void;
  disabled?: ButtonProps["disabled"];
  size?: ButtonProps["size"];
  color?: ButtonProps["color"];
  radius?: ButtonProps["radius"];
  gap?: CSSProperties["gap"];
  // baseVariant?: ButtonProps["variant"];
  // selectedVariant?: ButtonProps["variant"];
}

const SelectButton = <T extends string = string>({
  label,
  description,
  error,
  required,
  data,
  value,
  defaultValue,
  allowDeselect,
  groupType = "group",
  onChange,
  disabled,
  size,
  color = "default",
  radius = "sm",
  gap = "0.8rem",
  // baseVariant = "faded",
  // selectedVariant = "shadow",
  ...props
}: SelectButtonProps<T>) => {
  if (isEmpty(data)) throw new Error("Data is required for SelectButton.");

  const [_value, handleChange] = useUncontrolled<T | null>({
    value,
    defaultValue,
    onChange,
  });

  const handleSelect = useCallback(
    (value: string, disabled?: boolean) => {
      if (disabled || (_value === value && !allowDeselect)) return;
      handleChange(_value === value && allowDeselect ? null : (value as T));
    },
    [_value, allowDeselect],
  );

  return (
    <div className="flex flex-col gap-2" {...props}>
      {label && (
        <label
          className={cn({
            "after:text-danger after:content-['*']": required,
          })}
        >
          {label}
        </label>
      )}
      {description && <p className="text-foreground-500 text-sm">{description}</p>}
      <GroupComponent groupType={groupType} gap={gap}>
        {data.map((item, index) => {
          const selected = _value === item.value;
          return (
            <Button
              key={`button-select-${kebabCase(item.value)}-${index}`}
              size={size}
              color={"default"}
              radius={radius}
              disabled={item.disabled || disabled}
              startContent={item.startContent}
              endContent={item.endContent}
              onPress={() => handleSelect(item.value, item.disabled)}
              variant="faded"
              aria-checked={selected}
              role="radio"
              className={cn(selected && `border-${color}`)}
            >
              {item.label}
            </Button>
          );
        })}
      </GroupComponent>
      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
};

export default SelectButton;

type GroupCopmponentProps = Pick<SelectButtonProps, "groupType" | "gap"> & PropsWithChildren;

const GroupComponent: React.FC<GroupCopmponentProps> = ({ children, groupType, gap }) => {
  return groupType === "connected" ? (
    <ButtonGroup>{children}</ButtonGroup>
  ) : (
    <div
      className={cn("items-center", {
        "flex flex-wrap": groupType === "group",
        grid: groupType === "list",
      })}
      style={{ gap }}
    >
      {children}
    </div>
  );
};
