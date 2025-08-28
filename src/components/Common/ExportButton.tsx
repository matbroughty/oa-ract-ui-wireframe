import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { exportToCSV } from '../../utils/exportUtils';

interface ExportButtonProps<T extends Record<string, any>> extends Omit<ButtonProps, 'onClick'> {
  data: T[];
  filename: string;
  headers?: { key: string; label: string }[];
  label?: string;
}

export function ExportButton<T extends Record<string, any>>({
  data,
  filename,
  headers,
  label = 'Export CSV',
  ...buttonProps
}: ExportButtonProps<T>): JSX.Element {
  const handleExport = () => {
    exportToCSV(data, filename, headers);
  };

  return (
    <Button
      leftIcon={<DownloadIcon />}
      onClick={handleExport}
      size="sm"
      colorScheme="teal"
      {...buttonProps}
    >
      {label}
    </Button>
  );
}

export default ExportButton;
