"use client";

import { siteConfig } from "@/config/site";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes = siteConfig.themes;

const ThemeSwitchDropdown = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const themeIcon = themes.find(({ name }) => name === theme)?.icon;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const color = theme === "dark" ? "primary" : theme === "light" ? "warning" : "default";

  return (
    <Dropdown
      showArrow
      classNames={{
        content: "min-w-fit",
      }}
    >
      <DropdownTrigger>
        <Button isIconOnly variant="light" color={color} className="p-2">
          {themeIcon}
        </Button>
      </DropdownTrigger>
      <DropdownMenu disallowEmptySelection selectionMode="single" selectedKeys={[theme ?? ""]}>
        {themes.map(({ name, icon }) => (
          <DropdownItem
            color={color}
            value={name}
            key={name}
            textValue={name}
            onPress={() => setTheme(name)}
          >
            <div className="flex items-center gap-2 pr-2 capitalize">
              <div className="max-h-[50px]">{icon}</div>
              <p>{name}</p>
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default ThemeSwitchDropdown;
