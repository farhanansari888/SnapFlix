import { Check, Close, Eye, EyeOff } from "@/utils/icons";
import { Input, Progress } from "@heroui/react";
import { useDisclosure } from "@mantine/hooks";
import { forwardRef, memo } from "react";
import IconButton from "../button/IconButton";
import { cn } from "@/utils/helpers";

const requirements = [
  { re: /[0-9]/, label: "Includes number" },
  { re: /[a-z]/, label: "Includes lowercase letter" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special symbol" },
];

const getStrength = (password: string): number => {
  let multiplier = password.length > 7 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
};

const PasswordRequirement = memo(({ meets, label }: { meets: boolean; label: string }) => {
  return (
    <p className={`mt-1.5 flex items-center text-small ${meets ? "text-success" : "text-danger"}`}>
      {meets ? <Check className="text-xl" /> : <Close className="scale-150 text-xl" />}
      <span className="ml-2.5">{label}</span>
    </p>
  );
});

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type" | "endContent"> & {
  withStrengthMeter?: boolean;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ withStrengthMeter, ...props }, ref) => {
    const [show, { toggle }] = useDisclosure(false);
    const [meter, { open, close }] = useDisclosure(false);

    const strength = getStrength(props.value || "");
    const color = strength === 100 ? "success" : strength > 50 ? "warning" : "danger";

    const checks = requirements.map((requirement, index) => (
      <PasswordRequirement
        key={index}
        label={requirement.label}
        meets={requirement.re.test((props.value as string) || "")}
      />
    ));

    return (
      <div
        className={cn("relative flex flex-col gap-5", {
          "h-48": meter && withStrengthMeter,
        })}
        onFocusCapture={open}
        onBlurCapture={close}
      >
        <Input
          ref={ref}
          type={show ? "text" : "password"}
          endContent={
            <IconButton
              size="sm"
              variant="light"
              onPress={toggle}
              icon={show ? <EyeOff className="text-xl" /> : <Eye className="text-xl" />}
            />
          }
          {...props}
        />
        {meter && withStrengthMeter && (
          <div
            className={cn(
              "absolute z-100 w-full rounded-medium border-2 border-foreground-200 bg-secondary-background p-4 shadow-lg",
              {
                "top-[5.3rem]": props.isInvalid,
                "top-18": !props.isInvalid,
              },
            )}
          >
            <Progress
              aria-label="Password strength meter"
              color={color}
              value={strength}
              className="mb-4"
            />
            <PasswordRequirement
              label="Includes at least 8 characters"
              meets={((props.value as string) || "").length > 7}
            />
            {checks}
          </div>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
